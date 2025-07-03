import { Calendar, Clock, Users, Shield, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import TypewriterText from "./TypewriterText";
import MarqueeAlongSvgPath from "./MarqueeAlongSvgPath";
import { useState } from "react";

const features = [
  {
    icon: Clock,
    title: "Daily Sign-In/Out",
    description: "Quick and easy attendance tracking with timestamp recording"
  },
  {
    icon: Calendar,
    title: "Missed Days Tracking",
    description: "Automatic tracking of missed workdays with clear visibility"
  },
  {
    icon: Users,
    title: "Admin Dashboard",
    description: "Comprehensive oversight and reporting for Hub administrators"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Bank-level security with 99.9% uptime guarantee"
  }
];

const sectionVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  visible: {}
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

// SVG path for the marquee
const path = "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

// Innovation-themed images for the marquee
const innovationImages = [
  {
    src: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Innovation Hub"
  },
  {
    src: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Technology"
  },
  {
    src: "https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Collaboration"
  },
  {
    src: "https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Innovation"
  },
  {
    src: "https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Development"
  },
  {
    src: "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Learning"
  }
];

const LandingPage = ({ onOpenAuth }) => {
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  return (
    <div className="animated-bg-nice min-h-screen w-full relative overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">IIH Attendance</h1>
                <p className="text-xs text-gray-500">Innovation Hub</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => onOpenAuth("login")}
                className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
              >
                Sign In
              </Button>
              <Button
                onClick={() => onOpenAuth("register")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariant}
        className="relative py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center relative z-10">
            <motion.div variants={sectionVariant}>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                <TypewriterText 
                  text="Track Your Attendance at"
                  speed={60}
                  onComplete={() => setTypewriterComplete(true)}
                />
                {typewriterComplete && (
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    Ilorin Innovation Hub
                  </motion.span>
                )}
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: typewriterComplete ? 1 : 0 }}
                transition={{ delay: 0.8 }}
                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                Professional attendance tracking system designed for interns. 
                Sign in daily, track your progress, and never miss a workday.
              </motion.p>
              
              {typewriterComplete && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center relative"
                >
                  {/* Fancy Marquee Component */}
                  <div className="relative">
                    <MarqueeAlongSvgPath
                      path={path}
                      baseVelocity={8}
                      slowdownOnHover={true}
                      draggable={true}
                      repeat={2}
                      dragSensitivity={0.1}
                      className="absolute -left-24 sm:-left-32 top-32 scale-60 sm:scale-100 pointer-events-none"
                      grabCursor
                    >
                      {innovationImages.map((img, i) => (
                        <div
                          key={i}
                          className="w-14 h-14 hover:scale-150 duration-300 ease-in-out rounded-lg overflow-hidden shadow-lg"
                        >
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        </div>
                      ))}
                    </MarqueeAlongSvgPath>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        onClick={() => onOpenAuth("register")}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10"
                      >
                        Start Tracking Today
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => onOpenAuth("login")}
                      className="px-8 py-4 text-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    >
                      Sign In
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Attendance Tracking
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamlined features designed specifically for the Ilorin Innovation Hub internship program
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariant}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0,0,0,0.10)" }}
                className="transition-transform duration-300"
              >
                <Card 
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white/70 backdrop-blur-sm"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={sectionVariant}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Ilorin Innovation Hub
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                This attendance tracking system is specifically designed for the 
                Ilorin Innovation Hub's internship program, ensuring seamless 
                daily attendance monitoring for all interns.
              </p>
              <div className="space-y-4">
                {[
                  "Monday to Friday attendance tracking",
                  "Automatic missed days detection",
                  "Real-time dashboard updates",
                  "Secure authentication system"
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              variants={sectionVariant}
              className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Join the Innovation
              </h3>
              <p className="text-gray-600 mb-6">
                Be part of Ilorin's premier technology and innovation ecosystem
              </p>
              <Button
                onClick={() => onOpenAuth("register")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 hover:scale-105"
              >
                Get Started Now
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">IIH Attendance</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Professional attendance tracking for the Ilorin Innovation Hub internship program.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="https://iih.ng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Ilorin Innovation Hub</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
              <div className="text-gray-400 space-y-2">
                <p>Ilorin Innovation Hub</p>
                <p>8°28'56.5"N, 4°34'37.6"E</p>
                <p>Ilorin, Kwara State, Nigeria</p>
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Ilorin Innovation Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;