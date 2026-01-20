import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiLinkedin, FiGithub, FiInstagram, FiGlobe } from 'react-icons/fi';

const ContactUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gray-900">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 transform scale-105"
                style={{
                    backgroundImage: 'url("/20251223_103030.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(8px) brightness(0.4)',
                }}
            />

            {/* Animated Background Gradient Orb */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-2xl backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">

                {/* Header / Profile Section */}
                <div className="p-10 text-center relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md group"
                        title="Go Back"
                    >
                        <FiArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="relative inline-block group mb-6">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse"></div>
                        <div className="relative w-48 h-48 rounded-full p-1 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400">
                            <img
                                src="/profile.jpg"
                                alt="Aryan Srivastava"
                                className="w-full h-full rounded-full object-cover border-4 border-black/20 shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-2"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://ui-avatars.com/api/?name=Aryan+Srivastava&background=random&size=256";
                                }}
                            />
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">Aryan Srivastava</h1>
                    <p className="text-xl text-blue-200 font-medium tracking-wide">Full Stack Developer</p>
                </div>

                {/* Content Section */}
                <div className="p-10 bg-black/20 backdrop-blur-md border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {/* Contact Info */}
                        <a href="mailto:aryansri6362@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group cursor-pointer hover:-translate-y-1 hover:shadow-lg">
                            <div className="w-12 h-12 bg-blue-500/20 text-blue-300 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                <FiMail size={24} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm text-gray-400 font-medium mb-1">Email</p>
                                <p className="text-white font-medium truncate text-lg">aryansri6362@gmail.com</p>
                            </div>
                        </a>

                        <a href="tel:+918744012089" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group cursor-pointer hover:-translate-y-1 hover:shadow-lg">
                            <div className="w-12 h-12 bg-green-500/20 text-green-300 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                <FiPhone size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium mb-1">Phone</p>
                                <p className="text-white font-medium text-lg">8744012089</p>
                            </div>
                        </a>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-6 uppercase tracking-widest text-center">Connect with me</h3>
                        <div className="flex justify-center gap-6">
                            <SocialLink href="https://www.linkedin.com/in/aryan-srivastava-223694269" icon={<FiLinkedin size={28} />} label="LinkedIn" color="hover:bg-[#0077b5]" />
                            <SocialLink href="https://github.com/aryanwebd35" icon={<FiGithub size={28} />} label="GitHub" color="hover:bg-[#333]" />
                            <SocialLink href="https://www.instagram.com/ary.sri_35/" icon={<FiInstagram size={28} />} label="Instagram" color="hover:bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" />
                            <SocialLink href="https://aryan35.vercel.app" icon={<FiGlobe size={28} />} label="Portfolio" color="hover:bg-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const SocialLink = ({ href, icon, label, color }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col items-center"
    >
        <div className={`w-16 h-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl ${color} group-hover:border-transparent`}>
            <div className="transition-transform duration-300 group-hover:scale-110">
                {icon}
            </div>
        </div>
        <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-sm text-gray-300 font-medium whitespace-nowrap bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            {label}
        </span>
    </a>
);

export default ContactUs;
