"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';

// Define types for our income sources and cars
type IncomeSources = {
  clientPayments: number;
  monthlyRetainers: number;
  saasRevenue: number;
};

type Car = {
  name: string;
  price: number;
  image: string;
};

export default function Home() {
  // Cars we're tracking progress for
  const targetCars: Car[] = [
    { name: 'Audi R8 #1', price: 160000, image: '/audi-r8-yellow.webp' },
    { name: 'Audi R8 #2', price: 160000, image: '/audi-r8-red.png' },
    { name: 'AMG GT R', price: 170000, image: '/GTR1.jpg' },
  ];

  // Monthly recurring revenue target
  const monthlyTarget = 13000;

  // State for income sources
  const [income, setIncome] = useState<IncomeSources>({
    clientPayments: 0,
    monthlyRetainers: 0,
    saasRevenue: 0,
  });

  // State for total accumulation - always starts at 0
  const [totalAccumulated, setTotalAccumulated] = useState<number>(0);

  // Calculate totals
  const monthlyIncome = income.monthlyRetainers + income.saasRevenue;
  const totalCarCost = targetCars.reduce((sum, car) => sum + car.price/10, 0);

  // Estimate months to goal
  const monthsToGoal = monthlyIncome > 0
      ? Math.ceil((totalCarCost - totalAccumulated) / monthlyIncome)
      : Infinity;

  // Update total accumulated whenever income changes
  useEffect(() => {
    // This would typically connect to a real database
    // For now, we're just using the state
  }, [income]);

  // Handle input changes
  const handleIncomeChange = (field: keyof IncomeSources, value: string) => {
    const numValue = parseFloat(value) || 0;
    setIncome(prev => ({ ...prev, [field]: numValue }));
  };

  // Handle adding a one-time client payment to accumulated total
  const handleAddClientPayment = () => {
    setTotalAccumulated(prev => prev + income.clientPayments);
    setIncome(prev => ({ ...prev, clientPayments: 0 }));
  };

  // Calculate progress for each car
  const calculateCarProgress = (carIndex: number) => {
    const previousCarsTotal = targetCars
        .slice(0, carIndex)
        .reduce((sum, car) => sum + car.price, 0);

    const thisCarCost = targetCars[carIndex].price;
    const fundsForThisCar = Math.max(0, totalAccumulated - previousCarsTotal);
    const thisCarProgress = Math.min(100, (fundsForThisCar / thisCarCost) * 100);

    return thisCarProgress;
  };

  return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Head>
          <title>Luxury Car Progress Tracker</title>
          <meta name="description" content="Track your progress toward luxury car goals" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-12">
            Luxury Car Progress Tracker
          </h1>

          {/* Client Acquisition Inputs */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Client Acquisition</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">New Client Payment ($)</label>
                <div className="flex">
                  <input
                      type="number"
                      value={income.clientPayments || ''}
                      onChange={(e) => handleIncomeChange('clientPayments', e.target.value)}
                      className="bg-gray-700 rounded-l p-2 w-full text-white"
                      placeholder="One-time payment"
                  />
                  <button
                      onClick={handleAddClientPayment}
                      className="bg-green-600 hover:bg-green-700 px-4 rounded-r"
                  >
                    Add Client
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2">Monthly Retainer Amount ($)</label>
                <input
                    type="number"
                    value={income.monthlyRetainers || ''}
                    onChange={(e) => handleIncomeChange('monthlyRetainers', e.target.value)}
                    className="bg-gray-700 rounded p-2 w-full text-white"
                    placeholder="Monthly recurring revenue"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-400">Total Accumulated: <span className="text-white font-semibold">${totalAccumulated.toLocaleString()}</span></p>
            </div>
          </div>

          {/* SaaS Revenue (Optional) */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">SaaS Revenue (Optional)</h2>

            <div>
              <label className="block mb-2">Monthly SaaS Revenue ($)</label>
              <input
                  type="number"
                  value={income.saasRevenue || ''}
                  onChange={(e) => handleIncomeChange('saasRevenue', e.target.value)}
                  className="bg-gray-700 rounded p-2 w-full text-white"
                  placeholder="Additional MRR from your SaaS product"
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">MRR Target</p>
                <p className="text-2xl font-bold">${monthlyTarget.toLocaleString()}</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Current MRR</p>
                <p className="text-2xl font-bold">${monthlyIncome.toLocaleString()}</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Months to Goal</p>
                <p className="text-2xl font-bold">
                  {monthsToGoal === Infinity ? '∞' : monthsToGoal}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">MRR Progress</h3>
              <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (monthlyIncome / monthlyTarget) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                />
              </div>
              <p className="mt-2 text-center text-gray-400">
                {((monthlyIncome / monthlyTarget) * 100).toFixed(1)}% of target MRR (${monthlyIncome.toLocaleString()} / ${monthlyTarget.toLocaleString()})
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Overall Progress</h2>
            <div className="mb-2 flex justify-between">
              <span>${totalAccumulated.toLocaleString()}</span>
              <span>${totalCarCost.toLocaleString()}</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalAccumulated / totalCarCost) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              />
            </div>
            <p className="mt-2 text-center text-gray-400">
              {((totalAccumulated / totalCarCost) * 100).toFixed(1)}% Complete
            </p>
          </div>

          {/* Individual Car Progress */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {targetCars.map((car, index) => (
                <div key={car.name} className="bg-gray-800 rounded-lg">
                  <div className="h-48 relative mb-4 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      {/* This would be a real image in production */}
                      <div className="text-xl text-center">
                        {car.name}
                        <div className="flex items-center justify-center">
                          <Image className={"object-cover"} alt={car.name} src={car.image} width={1920} height={1080}/>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold">{car.name}</h3>
                  <p className="text-gray-400 mb-4">${car.price.toLocaleString()}</p>

                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateCarProgress(index)}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    />
                  </div>

                  <p className="mt-2 text-center text-gray-400">
                    {calculateCarProgress(index).toFixed(1)}% Complete
                  </p>
                </div>
            ))}
          </div>
        </main>
      </div>
  );
}