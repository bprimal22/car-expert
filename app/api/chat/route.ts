import { StreamingTextResponse } from "ai"

// This simulates a real API route that would connect to an AI model
export async function POST(req: Request) {
  const { messages, carData } = await req.json()

  // In a real app, we would use the AI SDK to connect to an LLM
  // For demo purposes, we'll create a simulated response
  const prompt = `
You are an AI car expert assistant helping a user with their ${carData.year} ${carData.make} ${carData.model}.
Vehicle details:
- Engine: ${carData.engine}
- Transmission: ${carData.transmission}
- Drivetrain: ${carData.drivetrain}
- Fuel Type: ${carData.fuelType}
- Fuel Economy: ${carData.mpg}

The user's latest message is: "${messages[messages.length - 1].content}"

Provide a helpful, friendly response about their vehicle. Include specific details about their car model when relevant.
Keep responses concise but informative.
`

  try {
    // In a real app, we would use the AI SDK like this:
    // const { text } = await generateText({
    //   model: openai('gpt-4o'),
    //   prompt: prompt,
    //   temperature: 0.7,
    //   maxTokens: 500,
    // })

    // For demo purposes, we'll simulate responses
    const simulatedResponses = [
      `Based on your ${carData.year} ${carData.make} ${carData.model}, I'd recommend an oil change every 5,000-7,500 miles with synthetic oil. Your 2.5L engine takes approximately 4.5 quarts. Regular maintenance will help maintain that excellent fuel economy of ${carData.mpg}!`,

      `Your ${carData.year} ${carData.make} ${carData.model} with the ${carData.engine} is known for its reliability. The timing chain (not belt) should last the lifetime of the vehicle with proper maintenance. Just keep up with regular oil changes using the recommended grade.`,

      `The ${carData.year} ${carData.make} ${carData.model} has a well-designed ${carData.transmission} that generally performs well. If you're experiencing hesitation during shifts, it could be the transmission fluid needs changing (recommended every 60,000 miles) or there might be an issue with the transmission control module.`,

      `For your ${carData.year} ${carData.make} ${carData.model}, winter tires would be a good investment if you live in an area with regular snow. With your ${carData.drivetrain} setup, quality winter tires will significantly improve traction and safety in cold weather conditions.`,

      `The ${carData.mpg} fuel economy on your ${carData.year} ${carData.make} ${carData.model} is quite good! To maintain optimal efficiency, keep your tires properly inflated (check the driver's door jamb for the correct PSI), replace the air filter regularly, and use the recommended octane fuel (regular 87 is fine for your engine).`,
    ]

    const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)]

    // Create a stream from the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // Simulate streaming by sending the response character by character
        for (let i = 0; i < randomResponse.length; i++) {
          controller.enqueue(encoder.encode(randomResponse[i]))
          // Add a small delay to simulate typing
          await new Promise((resolve) => setTimeout(resolve, 20))
        }

        controller.close()
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("Error generating response:", error)
    return new Response("Error generating response", { status: 500 })
  }
}

