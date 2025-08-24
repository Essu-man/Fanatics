'use client';

import React, { useState } from 'react';
import { Search, User, ShoppingCart } from 'lucide-react';

// 1. Define a type for the category keys
type CategoryKey = 'jerseys' | 'lingerie' | 'hats' | 'shoes';

const CedimanHomepage = () => {
  // 2. Use the type for useState
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('jerseys');

  // 3. Type the categories object
  const categories: Record<CategoryKey, {
    background: string;
    title: string;
    subtitle: string;
    heroImage: string;
  }> = {
    jerseys: {
      background: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'The Return\nOf Gameday',
      subtitle: 'Premium Sports Jerseys Collection',
      heroImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    lingerie: {
      background: 'https://images.unsplash.com/photo-1582542021865-bde52e6bac31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Comfort\n& Style',
      subtitle: 'Premium Intimate Apparel Collection',
      heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    hats: {
      background: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Top Off\nYour Look',
      subtitle: 'Premium Headwear Collection',
      heroImage: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    shoes: {
      background: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Step Up\nYour Game',
      subtitle: 'Premium Footwear Collection',
      heroImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    }
  };

  const categoryCards: {
    id: CategoryKey;
    name: string;
    image: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: 'jerseys',
      name: 'Jerseys',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      icon: '🏈',
      description: 'Team Colors & Custom Designs'
    },
    {
      id: 'lingerie',
      name: 'Lingerie',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      icon: '👙',
      description: 'Comfort Meets Elegance'
    },
    {
      id: 'hats',
      name: 'Hats',
      image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      icon: '🧢',
      description: 'Caps, Beanies & More'
    },
    {
      id: 'shoes',
      name: 'Shoes',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      icon: '👟',
      description: 'Athletic & Lifestyle Footwear'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-900">
                <span className="bg-blue-900 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-2">
                  C
                </span>
                Cediman
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What can we help you find?"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <User className="h-6 w-6 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" />
              <ShoppingCart className="h-6 w-6 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-2 py-4">
              {categoryCards.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 font-medium rounded-full border-2 transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-blue-900 text-white border-blue-900 shadow-lg transform scale-105'
                      : 'text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div 
          className="h-96 bg-gradient-to-r from-slate-900 via-slate-800 to-green-700 flex items-center transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(21, 128, 61, 0.75)), url('${categories[activeCategory].background}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-2 leading-tight whitespace-pre-line">
                {categories[activeCategory].title}
              </h1>
              <p className="text-lg mb-6 opacity-90">{categories[activeCategory].subtitle}</p>
              <button className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Shop Now
              </button>
            </div>
            <div className="hidden md:block">
              <img 
                src={categories[activeCategory].heroImage} 
                alt="Featured Product"
                className="w-64 h-64 object-contain opacity-90 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categoryCards.map((category) => (
            <div key={category.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square mb-4 shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300"></div>
                
                {/* Category Icon and Title */}
                <div className="absolute top-4 left-4">
                  <span className="text-3xl mb-2 block">{category.icon}</span>
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                </div>
                
                {/* Bottom Button Card */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="bg-slate-800 bg-opacity-95 backdrop-blur-sm rounded-lg p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 border border-slate-600">
                    <button 
                      onClick={() => setActiveCategory(category.id)}
                      className="w-full text-white font-semibold text-center hover:text-blue-300 transition-colors py-1"
                    >
                      Shop {category.name}
                    </button>
                    <div className="text-xs text-gray-300 text-center mt-1">
                      {category.description}
                    </div>
                    <div className="text-xs text-blue-300 text-center mt-1 opacity-75">
                      View Collection →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders over $50</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Top-rated products</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CedimanHomepage;