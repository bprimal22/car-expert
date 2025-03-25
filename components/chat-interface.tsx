"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"

import {VehicleData} from "@/lib/vehicleDatabases/vehicleData";

interface ChatInterfaceProps {
  vehicleData: VehicleData
}

type Message = {
  role: "user" | "assistant"
  content: string
}

// Declare webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

export default function ChatInterface({ vehicleData }: ChatInterfaceProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // In a real app, we would use the AI SDK to connect to an LLM
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI car expert. I see you have a ${vehicleData.basic.year} ${vehicleData.basic.make} ${vehicleData.basic.model}. How can I help you with your vehicle today?`,
      },
    ],
    body: {
      vehicleData: vehicleData,
    },
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleListening = () => {
    if (!isListening) {
      startListening()
    } else {
      stopListening()
    }
  }

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please type your question instead.",
        variant: "destructive",
      })
      return
    }

    // @ts-ignore - WebkitSpeechRecognition is not in the TypeScript types
    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = (event: any) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      setTranscript(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event)
      setIsListening(false)
      toast({
        title: "Speech Recognition Error",
        description: "There was an error with speech recognition. Please try again or type your question.",
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript) {
        handleInputChange({ target: { value: transcript } } as any)
      }
    }

    recognition.start()
  }

  const stopListening = () => {
    setIsListening(false)
    // @ts-ignore - WebkitSpeechRecognition is not in the TypeScript types
    if ("webkitSpeechRecognition" in window) {
      // @ts-ignore
      const recognition = new window.webkitSpeechRecognition()
      recognition.stop()
    }
  }

  return (
    <Card className="h-[70vh] flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg">Car Expert Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn("flex items-start gap-3 text-sm", message.role === "user" ? "flex-row-reverse" : "")}
              >
                <Avatar className="mt-1">
                  {message.role === "assistant" ? (
                    <>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
                      <AvatarFallback>You</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[80%]",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 text-sm">
                <Avatar className="mt-1">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 max-w-[80%] bg-muted">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-75" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Button
            type="button"
            size="icon"
            variant={isListening ? "default" : "outline"}
            className="rounded-full flex-shrink-0"
            onClick={toggleListening}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="sr-only">{isListening ? "Stop listening" : "Start listening"}</span>
          </Button>
          <Input
            id="message"
            placeholder={isListening ? "Listening..." : "Ask about your car..."}
            value={isListening ? transcript : input}
            onChange={handleInputChange}
            className="flex-1"
            disabled={isListening}
          />
          <Button type="submit" size="icon" className="rounded-full flex-shrink-0">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

