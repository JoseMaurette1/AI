"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { heroContent } from '../data/content'
import Icons from './Icons'

const Hero = () => {
  const router = useRouter()
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{heroContent.title}</h1>
          <h2 className="text-2xl font-bold mb-4">{heroContent.subtitle}</h2>
          <p className="text-lg text-muted-foreground mb-6">{heroContent.description}</p>
        </div>
        <div className="flex flex-col items-center justify-center"><Icons /></div>
          <div className="grid grid-cols-2 gap-6 w-full max-w-4xl mt-8">
            {heroContent.cards.map((card) => (
              <Card 
                key={card.id} 
                className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300" 
                onClick={() => router.push(card.link || '/')}
              >
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <p className="text-sm mb-4">{card.date}</p>
                </CardHeader>
                <CardContent>
                  <Image 
                    src={card.image || '/'} 
                    alt={card.title} 
                    width={350} 
                    height={300} 
                  />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </>
  )
}

export default Hero