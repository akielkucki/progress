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

type SavedData = {
  income: IncomeSources;
  totalAccumulated: number;
  lastUpdated: string;
};

export default function Home() {
  // Cars we're tracking progress for
  const targetCars: Car[] = [
    { name: 'Audi R8 #1', price: 150000, image: '/audi-r8-yellow.webp' },
    { name: 'Audi R8 #2', price: 150000, image: '/audi-r8-red.png' },
    { name: 'AMG GT R', price: 105000, image: '/GTR1.jpg' },
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

  // Save/load functionality
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('carProgressData');
      if (savedData) {
        const parsedData: SavedData = JSON.parse(savedData);
        setIncome(parsedData.income);
        setTotalAccumulated(parsedData.totalAccumulated);
        setSaveStatus(`Last loaded: ${parsedData.lastUpdated}`);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Calculate totals
  const monthlyIncome = income.monthlyRetainers + income.saasRevenue;
  const totalCarCost = targetCars.reduce((sum, car) => sum + car.price/12.5, 0);

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
    const newTotal = totalAccumulated + income.clientPayments;
    setTotalAccumulated(newTotal);
    setIncome(prev => ({ ...prev, clientPayments: 0 }));

    // Auto-save after adding a client
    saveData(income, newTotal);
  };

  // Save data to localStorage and as downloadable JSON
  const saveData = (currentIncome: IncomeSources, currentTotal: number) => {
    try {
      const now = new Date().toLocaleString();
      const dataToSave: SavedData = {
        income: currentIncome,
        totalAccumulated: currentTotal,
        lastUpdated: now
      };

      // Save to localStorage
      localStorage.setItem('carProgressData', JSON.stringify(dataToSave));

      // Update status
      setSaveStatus(`Last saved: ${now}`);
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus('Error saving data');
    }
  };

  // Save current state
  const handleSaveData = () => {
    saveData(income, totalAccumulated);
  };

  // Export data as downloadable JSON file
  const handleExportData = () => {
    try {
      const now = new Date().toLocaleString().replace(/[/:]/g, '-');
      const dataToExport: SavedData = {
        income: income,
        totalAccumulated: totalAccumulated,
        lastUpdated: now
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `car-progress-${now}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveStatus(`Exported: ${now}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveStatus('Error exporting data');
    }
  };

  // Import data from JSON file
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData: SavedData = JSON.parse(content);

          setIncome(importedData.income);
          setTotalAccumulated(importedData.totalAccumulated);

          // Also save to localStorage
          localStorage.setItem('carProgressData', content);

          setSaveStatus(`Imported: ${importedData.lastUpdated}`);
        } catch (parseError) {
          console.error('Error parsing imported file:', parseError);
          setSaveStatus('Error importing data: Invalid format');
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing data:', error);
      setSaveStatus('Error importing data');
    }
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
      <div className="min-h-screen bg-black text-white">
        <Head>
          <title>Luxury Car Progress Tracker</title>
          <meta name="description" content="Track your progress toward luxury car goals" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl font-light text-center mb-12 tracking-wider border-b border-gray-800 pb-4">
            LUXURY CAR PROGRESS TRACKER
          </h1>

          {/* Client Acquisition Inputs */}
          <div className="bg-black border border-gray-800 rounded p-6 mb-6 max-w-3xl mx-auto shadow-sm">
            <h2 className="text-xl font-light mb-6 tracking-wide uppercase text-gray-300">Client Acquisition</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm text-gray-400">New Client Payment ($)</label>
                <div className="flex">
                  <input
                      type="number"
                      value={income.clientPayments || ''}
                      onChange={(e) => handleIncomeChange('clientPayments', e.target.value)}
                      className="bg-black border border-gray-800 rounded-l p-2 w-full text-white focus:outline-none focus:border-white"
                      placeholder="One-time payment"
                  />
                  <button
                      onClick={handleAddClientPayment}
                      className="border border-white px-4 rounded-r hover:bg-white hover:text-black transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Monthly Retainer Amount ($)</label>
                <input
                    type="number"
                    value={income.monthlyRetainers || ''}
                    onChange={(e) => handleIncomeChange('monthlyRetainers', e.target.value)}
                    className="bg-black border border-gray-800 rounded p-2 w-full text-white focus:outline-none focus:border-white"
                    placeholder="Monthly recurring revenue"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-400 text-sm">Total Accumulated: <span className="text-white font-light">${totalAccumulated.toLocaleString()}</span></p>
            </div>
          </div>

          {/* SaaS Revenue (Optional) */}
          <div className="bg-black border border-gray-800 rounded p-6 mb-6 max-w-3xl mx-auto shadow-sm">
            <h2 className="text-xl font-light mb-6 tracking-wide uppercase text-gray-300">SaaS Revenue (Optional)</h2>

            <div>
              <label className="block mb-2 text-sm text-gray-400">Monthly SaaS Revenue ($)</label>
              <input
                  type="number"
                  value={income.saasRevenue || ''}
                  onChange={(e) => handleIncomeChange('saasRevenue', e.target.value)}
                  className="bg-black border border-gray-800 rounded p-2 w-full text-white focus:outline-none focus:border-white"
                  placeholder="Additional MRR from your SaaS product"
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-black border border-gray-800 rounded p-6 mb-8 max-w-3xl mx-auto shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="border-r border-gray-800 pr-4 last:border-r-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider">MRR Target</p>
                <p className="text-xl font-light mt-1">${monthlyTarget.toLocaleString()}</p>
              </div>

              <div className="border-r border-gray-800 pr-4 last:border-r-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Current MRR</p>
                <p className="text-xl font-light mt-1">${monthlyIncome.toLocaleString()}</p>
              </div>

              <div className="border-r border-gray-800 pr-4 last:border-r-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Months to Goal</p>
                <p className="text-xl font-light mt-1">
                  {monthsToGoal === Infinity ? '∞' : monthsToGoal}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-light uppercase tracking-wider text-gray-400 mb-2">MRR Progress</h3>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (monthlyIncome / monthlyTarget) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-white"
                />
              </div>
              <p className="mt-2 text-right text-xs text-gray-500">
                {((monthlyIncome / monthlyTarget) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-black border border-gray-800 rounded p-6 mb-8 max-w-3xl mx-auto shadow-sm">
            <h2 className="text-xl font-light mb-6 tracking-wide uppercase text-gray-300">Car Collection Progress (Downpayment)</h2>
            <div className="mb-2 flex justify-between text-xs text-gray-500">
              <span>${totalAccumulated.toLocaleString()}</span>
              <span>${totalCarCost.toLocaleString()}</span>
            </div>
            <div className="h-px bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalAccumulated / totalCarCost) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-white"
              />
            </div>
            <p className="mt-2 text-right text-xs text-gray-500">
              {((totalAccumulated / totalCarCost) * 100).toFixed(1)}%
            </p>
          </div>

          {/* Individual Car Progress */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {targetCars.map((car, index) => (
                <div key={car.name} className="bg-black border border-gray-800 rounded p-5 shadow-sm">
                  <div className="h-40 relative mb-4 border border-gray-800 rounded overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full absolute top-0 bottom-0 right-0 left-0">
                      <Image alt={car.name} src={car.image} width={1920} height={1080} className="object-cover object-center z-0" />
                    </div>
                    <div className="text-base text-center p-4 z-10 flex items-center justify-center flex-col w-full h-full bg-black/50">
                  <span className="text-xs text-gray-300 uppercase tracking-wider block mb-2">
                    {car.name}
                  </span>
                      <span className="text-xl font-light text-white">
                    ${car.price.toLocaleString()}
                  </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateCarProgress(index)}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-white"
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-white">{calculateCarProgress(index).toFixed(1)}%</span>
                  </div>
                </div>
            ))}
          </div>
        </main>
      </div>
  );
}