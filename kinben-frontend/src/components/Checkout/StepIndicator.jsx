import React from 'react';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Shipping' },
    { number: 2, title: 'Billing' },
    { number: 3, title: 'Payment' },
    { number: 4, title: 'Review' }
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step */}
          <div
            className={`flex flex-col items-center ${
              currentStep >= step.number ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : currentStep === step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
              {step.title}
            </p>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-4 mb-6 transition-colors ${
                currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
