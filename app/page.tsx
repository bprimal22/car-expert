"use client"

import type React from "react"

import { useState } from "react"
import { Car, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import VinScanner from "@/components/vin-scanner"
import ChatInterface from "@/components/chat-interface"

export default function Home() {
  const [activeTab, setActiveTab] = useState("scan")
  const [vinNumber, setVinNumber] = useState("")
  const [carData, setCarData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleVinCapture = async (vin: string) => {
    setVinNumber(vin)
    await fetchCarData(vin)
    setActiveTab("info")
  }

  const handleManualVinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (vinNumber.length < 17) {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN number",
        variant: "destructive",
      })
      return
    }
    await fetchCarData(vinNumber)
  }

  const fetchCarData = async (vin: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to a car database
      // For demo purposes, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setCarData({
        make: "Toyota",
        model: "Camry",
        year: "2020",
        engine: "2.5L 4-Cylinder",
        transmission: "8-Speed Automatic",
        drivetrain: "Front-Wheel Drive",
        fuelType: "Gasoline",
        mpg: "28 city / 39 highway",
        vin: vin,
      })
      setActiveTab("info")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicle information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-md mx-auto p-4">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Car className="h-6 w-6" />
            Car Assistant
          </CardTitle>
          <CardDescription>Scan your VIN number or chat with our AI car expert</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="scan">Scan VIN</TabsTrigger>
              <TabsTrigger value="info" disabled={!carData}>
                Car Info
              </TabsTrigger>
              <TabsTrigger value="chat" disabled={!carData}>
                Expert Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scan your VIN number</CardTitle>
                  <CardDescription>Position your camera over the VIN barcode or enter it manually</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <VinScanner onVinCaptured={handleVinCapture} />

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                    </div>
                  </div>

                  <form onSubmit={handleManualVinSubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Input
                        id="vin"
                        placeholder="Enter 17-character VIN number"
                        value={vinNumber}
                        onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
                        maxLength={17}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Loading..." : "Look Up Vehicle"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              {carData && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {carData.year} {carData.make} {carData.model}
                    </CardTitle>
                    <CardDescription>VIN: {carData.vin}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Engine:</div>
                      <div>{carData.engine}</div>

                      <div className="font-medium">Transmission:</div>
                      <div>{carData.transmission}</div>

                      <div className="font-medium">Drivetrain:</div>
                      <div>{carData.drivetrain}</div>

                      <div className="font-medium">Fuel Type:</div>
                      <div>{carData.fuelType}</div>

                      <div className="font-medium">Fuel Economy:</div>
                      <div>{carData.mpg}</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setActiveTab("chat")}>
                      Chat with Car Expert <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              {carData && <ChatInterface carData={carData} />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}

