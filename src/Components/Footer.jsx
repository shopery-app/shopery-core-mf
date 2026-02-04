import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaTelegramPlane,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-16 px-4">
      <div className="max-w-[90%] lg:max-w-[85%] m-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 mb-14">
          <div className="left-footer flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="shopery">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Shopery
              </h2>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-gray-400">
          <div>
            <h3 className="font-semibold text-lg mb-5 text-white">Company</h3>
            <p className="text-sm mb-2">Find a location nearest you.</p>
            <p className="text-sm mb-4 font-medium cursor-pointer hover:text-white transition">
              See Our Stores
            </p>
            <p className="text-sm">+391 (0)35 2568 4593</p>
            <p className="text-sm">contact@shopery.com</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5 text-white">About Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white cursor-pointer transition">
                Contact Us
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Sitemap
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Conditions
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Our Products
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Privacy Policy
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5 text-white">Service</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white cursor-pointer transition">
                Help & Contact
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Returns & Refunds
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Online Stores
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Refer a Friend
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Terms & Conditions
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-5 text-white">
              Contact Us
            </h3>
            <p className="text-sm mb-5">
              Enter your email below to be the first to know about new
              collections and product launches.
            </p>
            <div className="flex items-center border border-white rounded-full overflow-hidden bg-black">
              <input
                type="email"
                placeholder="example@gmail.com"
                className="px-4 py-3 text-sm w-full outline-none bg-black text-white
                          placeholder:!text-white placeholder:opacity-100"
              />
              <button className="px-5 text-white font-bold hover:text-gray-300 transition">
                →
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 my-12"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-6 text-gray-400">
            <FaFacebookF
              size={22}
              className="cursor-pointer hover:text-white transition"
            />
            <FaTwitter
              size={22}
              className="cursor-pointer hover:text-white transition"
            />
            <FaLinkedinIn
              size={22}
              className="cursor-pointer hover:text-white transition"
            />
            <FaTelegramPlane
              size={22}
              className="cursor-pointer hover:text-white transition"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
