"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import ImageCard from "@/components/ai/image-card";

import * as fal from "@fal-ai/serverless-client";
import Spinner from "@/components/spinner";
import { RequestLog } from "@fal-ai/serverless-client/src/types";

const NEGATIVE_PROMPT =
  "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3), (face asymmetry, eyes asymmetry, deformed eyes, open mouth)";

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai("gpt-3.5-turbo"),
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      generateNewImage: {
        description: "Generate a new image based on the prompt given",
        parameters: z.object({
          prompt: z.string().describe("The prompt to generate the image from"),
        }),
        generate: async function* ({ prompt }) {
          yield (
            <div className="flex gap-1.5 items-center">
              <code className="text-muted-foreground">Generating Image</code>
              <Spinner />
            </div>
          );

          const newImage = await fal.subscribe("fal-ai/realistic-vision", {
            input: {
              prompt,
              model_name: "SG161222/RealVisXL_V4.0",
              negative_prompt: NEGATIVE_PROMPT,
              expand_prompt: true,
            },
            logs: true,
            onQueueUpdate: (update) => {
              if (update.status === "IN_PROGRESS") {
                update.logs?.map((log) => log.message).forEach(console.log);
              }
            },
          });

          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: "assistant",
              content: `Generated image based on the prompt: ${prompt}`,
            },
          ]);

          return <ImageCard newImage={newImage} />;
        },
      },
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
