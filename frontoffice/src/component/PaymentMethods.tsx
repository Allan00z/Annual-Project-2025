import React from 'react';

export default function PaymentMethods() {
  return (
    <div className="flex items-center justify-center space-x-4 mt-4">
      <span className="text-sm text-gray-600">Nous acceptons:</span>
      <div className="flex space-x-2">
        {/* Visa */}
        <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
          VISA
        </div>
        {/* Mastercard */}
        <div className="w-8 h-5 bg-red-500 rounded text-white text-xs font-bold flex items-center justify-center">
          MC
        </div>
        {/* American Express */}
        <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs font-bold flex items-center justify-center">
          AE
        </div>
        {/* Stripe */}
        <div className="w-8 h-5 bg-purple-600 rounded text-white text-xs font-bold flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
