import React, { useEffect, useRef } from 'react';
import {
  Gift,
  Coffee,
  Star,
  QrCode,
  MapPin,
  Truck,
  CreditCard,
  Image as ImageIcon,
  UserCircle,
  ShoppingCart,
  MessageCircle,
  Clock,
  RotateCw
} from 'lucide-react';

// Define the CSS animation in a global style
const animationStyle = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .feature-card.animate-in {
    animation: fadeInUp 0.6s ease forwards;
  }

  @keyframes float {
    0% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
    }
    100% {
      transform: translateY(0px) rotate(0deg);
    }
  }

  .floating {
    animation: float 6s ease-in-out infinite;
  }

  .video-container {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  }

  .ar-video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%);
    pointer-events: none;
  }

  .ar-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: rgba(255,255,255,0.9);
    color: #7c5a3c;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.8rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    z-index: 10;
  }
`;

const FeatureSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Animation for feature cards on scroll and video autoplay
  useEffect(() => {
    // Add animation styles to head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyle;
    document.head.appendChild(styleElement);

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Animate feature cards
            const cards = document.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-in');
              }, index * 150);
            });

            // Play the video when it's visible
            if (videoRef.current) {
              videoRef.current.play().catch(e => {
                console.log('Auto-play prevented:', e);
                // Show play button if autoplay is blocked
              });
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      // Clean up style element
      document.head.removeChild(styleElement);
    };
  }, []);

  const features = [
    {
      icon: <Coffee className='h-10 w-10 text-coffee-light' />,
      title: 'Rich Product Catalog',
      description:
        'Browse our extensive menu of specialty coffees, teas, and pastries with high-quality images and detailed descriptions.'
    },
    {
      icon: <MessageCircle className='h-10 w-10 text-coffee-light' />,
      title: 'Customizable Orders',
      description:
        'Personalize your drinks with options for milk type, sweetness level, toppings, and more to create your perfect beverage.'
    },
    {
      icon: <ShoppingCart className='h-10 w-10 text-coffee-light' />,
      title: 'Easy Ordering',
      description: 'Order ahead with our intuitive cart system and skip the line when you arrive at the café.'
    },
    {
      icon: <Truck className='h-10 w-10 text-coffee-light' />,
      title: 'Delivery Options',
      description:
        'Choose between pickup or delivery with real-time tracking to know exactly when your coffee will arrive at your doorstep.'
    },
    {
      icon: <Star className='h-10 w-10 text-coffee-light' />,
      title: 'Loyalty Program',
      description: 'Earn points with every purchase and redeem them for free items through our tiered rewards system.'
    },
    {
      icon: <Gift className='h-10 w-10 text-coffee-light' />,
      title: 'Digital Gift Cards',
      description:
        'Send personalized gift cards with custom amounts to friends and family, redeemable in-store or online.'
    },
    {
      icon: <CreditCard className='h-10 w-10 text-coffee-light' />,
      title: 'Secure Payments',
      description:
        'Pay safely using multiple payment methods including credit cards, mobile wallets, and our app balance.'
    },
    {
      icon: <QrCode className='h-10 w-10 text-coffee-light' />,
      title: 'Scan & Order',
      description: 'Scan the QR code at your table to view the menu and order directly without waiting in line.'
    },
    {
      icon: <MapPin className='h-10 w-10 text-coffee-light' />,
      title: 'Store Locator',
      description: 'Find the nearest café locations with operating hours, contact information, and amenities.'
    },
    {
      icon: <Clock className='h-10 w-10 text-coffee-light' />,
      title: 'Order History',
      description: 'View your past orders and easily reorder your favorite items with a single tap.'
    },
    {
      icon: <ImageIcon className='h-10 w-10 text-coffee-light' />,
      title: 'Visual Menu',
      description: 'See beautiful images of our products to help you make the perfect choice for your coffee craving.'
    },
    {
      icon: <UserCircle className='h-10 w-10 text-coffee-light' />,
      title: 'User Profiles',
      description: 'Create your personal profile to save favorites, payment methods, and delivery addresses.'
    }
  ];

  return (
    <section ref={sectionRef} id='features' className='py-20 bg-gradient-to-b from-white to-coffee-cream/20'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='font-poppins text-4xl md:text-5xl font-bold text-coffee-dark mb-4'>
            <span className='relative'>
              Crafted for Coffee Lovers
              <span className='absolute -bottom-2 left-0 right-0 h-1 bg-coffee-light opacity-70 rounded-full'></span>
            </span>
          </h2>
          <p className='text-gray-600 max-w-3xl mx-auto text-lg mt-6'>
            Experience coffee like never before with our feature-rich app designed to enhance every aspect of your café
            visit, from ordering to delivery.
          </p>
        </div>

        {/* 3D Product Showcase */}
        <div className='mb-24 py-10 bg-gradient-to-r from-coffee-dark to-coffee-light/90 rounded-3xl overflow-hidden'>
          <div className='flex flex-col md:flex-row items-center justify-between px-8 md:px-16'>
            <div className='w-full md:w-1/2 text-white mb-10 md:mb-0'>
              <div className='inline-flex items-center px-4 py-2 bg-white/10 rounded-full mb-6'>
                <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M20.42 4.58C16.84 1.01 10.76.999 7.17 4.58c-3.59 3.59-3.59 9.41 0 13 1.79 1.8 4.14 2.7 6.48 2.7s4.69-.9 6.48-2.7c3.59-3.58 3.59-9.41.29-13z'></path>
                </svg>
                <span className='text-sm font-semibold'>Exclusive Feature</span>
              </div>

              <h3 className='text-4xl md:text-5xl font-bold mb-4'>Interactive 3D Coffee Experience</h3>
              <p className='text-white/80 text-lg mb-8'>
                View each of our coffee products in stunning 3D detail. Rotate, zoom, and examine every delicious aspect
                of our beverages before you order, just like in real life.
              </p>

              <ul className='space-y-4 mb-8'>
                <li className='flex items-start'>
                  <svg
                    className='w-6 h-6 text-coffee-cream mr-3 mt-0.5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                  </svg>
                  <span>360° rotation to see every detail</span>
                </li>
                <li className='flex items-start'>
                  <svg
                    className='w-6 h-6 text-coffee-cream mr-3 mt-0.5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                  </svg>
                  <span>Zoom in to see ingredients and toppings</span>
                </li>
                <li className='flex items-start'>
                  <svg
                    className='w-6 h-6 text-coffee-cream mr-3 mt-0.5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                  </svg>
                  <span>Realistic rendering with accurate sizes</span>
                </li>
              </ul>

              <button className='inline-flex items-center px-6 py-3 bg-coffee-cream text-coffee-dark font-semibold rounded-full hover:bg-white transition-colors duration-300'>
                <RotateCw className='w-5 h-5 mr-2' />
                Try 3D Viewer
              </button>
            </div>

            <div className='w-full md:w-1/2 flex justify-center relative'>
              {/* AR Video Showcase */}
              <div className='video-container w-full max-w-md'>
                <span className='ar-badge'>AR View</span>
                <div className='ar-video-overlay'></div>
                <video
                  ref={videoRef}
                  className='w-full h-auto rounded-xl shadow-xl'
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster='/main-sc.jpeg' // Add a poster image path here
                >
                  {/* Replace the src with your actual AR/3D video path */}
                  <source src='/1.mp4' type='video/mp4' />
                  Your browser does not support the video tag.
                </video>

                {/* Interactive elements */}
                <div className='absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-50'>
                  <div className='w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors'>
                    <svg
                      className='w-5 h-5 text-coffee-dark'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M15 15l6 6m-6-6v6m-6-6h6'></path>
                    </svg>
                  </div>
                  <div className='w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors'>
                    <svg
                      className='w-5 h-5 text-coffee-dark'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <circle cx='12' cy='12' r='10'></circle>
                      <circle cx='12' cy='12' r='4'></circle>
                    </svg>
                  </div>
                  <div className='w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors'>
                    <svg
                      className='w-5 h-5 text-coffee-dark'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5'></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className='text-3xl font-bold text-coffee-dark mb-12 text-center'>More Amazing Features</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='feature-card bg-white p-6 rounded-xl shadow-md hover:shadow-xl transform transition-all duration-300 hover:-translate-y-2 border border-coffee-cream/30 opacity-0'
            >
              <div className='bg-coffee-cream/30 rounded-full p-4 inline-flex items-center justify-center mb-5 group-hover:bg-coffee-cream transition-colors duration-300'>
                {feature.icon}
              </div>
              <h3 className='text-xl font-poppins font-semibold text-coffee-dark mb-3'>{feature.title}</h3>
              <p className='text-gray-600'>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Decorative elements */}
        <div className='relative mt-20 hidden md:block'>
          <div className='absolute -top-10 -left-10 w-20 h-20 rounded-full bg-coffee-light/10 z-0'></div>
          <div className='absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-coffee-light/10 z-0'></div>
          <div className='absolute top-1/4 right-1/4 w-8 h-8 rounded-full bg-coffee-light/20 z-0'></div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
