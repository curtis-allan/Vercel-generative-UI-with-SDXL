import { Input } from "@/components/ui/input";
import { Send, Settings2, X } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import * as fal from "@fal-ai/serverless-client";
import { cn, getDimensions } from "@/lib/utils";
import { AspectRatio } from "./ui/aspect-ratio";
import { RequestLog } from "@fal-ai/serverless-client/src/types";
import Spinner from "./spinner";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const FormSchema = z.object({
  model_name: z.string(),
  prompt: z
    .string()
    .min(1, { message: "Please enter a prompt." })
    .max(300, { message: "Prompt must not exceed 300 characters." }),
  negative_prompt: z.string().max(1500, {
    message: "Negative Prompt must not exceed 1500 characters.",
  }),
  image_size: z.string(),
  //   num_inference_steps: z.number().min(1).max(12),
  //   guidance_scale: z.number().min(1).max(2),
  //   loras: z.optional(z.string().url()),
  //   embeddings: z.optional(z.string().url()),
  //   seed: z.optional(z.number()),
  //   expand_prompt: z.boolean(),
});

export default function TextToImage() {
  const [image, setImage] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updates, setUpdates] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [progress, setProgress] = useState<string>("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      model_name: "Lykon/dreamshaper-xl-lightning",
      prompt: "",
      negative_prompt:
        "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad eyes, bad iris, bad teeth, bad arms, bad legs, deformities:1.3)",
      image_size: "square_hd",
      //   num_inference_steps: 5,
      //   guidance_scale: 2,
      //   loras: "",
      //   embeddings: "",
      //   expand_prompt: false,
      //   seed: 9999999,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setImage(null);

    const newImage = await fal.subscribe("fal-ai/lightning-models", {
      input: {
        ...data,
        num_inference_steps: 5,
        guidance_scale: 2,
        num_images: 1,
        sync_mode: true,
        enable_safety_checker: false,
      },
      logs: true,
      pollInterval: 100,
      onQueueUpdate: (update) => {
        setUpdates(update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs!.map((log) => setProgress(log.message));
        }
      },
    });

    setAspectRatio(getDimensions(data.image_size!)?.at(2)!);
    setUpdates("");
    setImage(newImage || null);
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex justify-center items-center ring rounded-md p-2">
        <div className="w-[400px]">
          {image ? (
            <AspectRatio ratio={aspectRatio}>
              <Image
                //@ts-ignore
                src={image?.images[0]?.url}
                className="object-cover rounded-md"
                alt="image generation"
                fill
                priority
              />
            </AspectRatio>
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center h-[400px] w-full bg-zinc-800 max-w-lg rounded-md",
                isLoading ? "animate-pulse" : ""
              )}
            >
              <div className="flex flex-col w-full items-center justify-center gap-2">
                <p className="italic text-lg tracking-tight">{updates}</p>
                {progress}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4 p-4 rounded-t-xl border-t inset-x-0 bottom-0 fixed">
        <ModeToggle />
        <Form {...form}>
          <form
            className="flex w-full gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter a prompt for your image."
                        className="bg-muted/60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex gap-1.5">
                    Loading <Spinner />
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    Send Message <Send size={20} strokeWidth={1.75} />
                  </div>
                )}
              </Button>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant={"outline"} size={"icon"}>
                  <Settings2 className="h-[1.2rem] w-[3rem]" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Settings</SheetTitle>
                  <SheetDescription>
                    Adjust specific image & model settings below.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col items-start gap-4">
                    <FormField
                      control={form.control}
                      name="model_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model Name</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a model to use" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Lykon/dreamshaper-xl-lightning">
                                DreamshaperXL Lightning
                              </SelectItem>
                              <SelectItem value="SG161222/RealVisXL_V4.0_Lightning">
                                RealVisXL v4.0 Lightning
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the model you want to use.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col w-full gap-4">
                      <FormField
                        control={form.control}
                        name="negative_prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Negative Prompt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your negative prompts."
                                className="resize-none min-h-28"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter negative prompts here (eg. worst quality,
                              bad atanomy)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="image_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image Size</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <div className="flex gap-1.5 items-center">
                                  <FormControl>
                                    <SelectTrigger className="flex-1 text-left">
                                      <SelectValue placeholder="Select an image size" />
                                    </SelectTrigger>
                                  </FormControl>

                                  <SelectContent>
                                    <SelectItem value="square_hd">
                                      Square HD
                                    </SelectItem>
                                    <SelectItem value="square">
                                      Square
                                    </SelectItem>
                                    <SelectItem value="portrait_4_3">
                                      Portrait 4:3
                                    </SelectItem>
                                    <SelectItem value="portrait_16_9">
                                      Portrait 16:9
                                    </SelectItem>
                                    <SelectItem value="landscape_4_3">
                                      Landscape 4:3
                                    </SelectItem>
                                    <SelectItem value="landscape_16_9">
                                      Landscape 16:9
                                    </SelectItem>
                                  </SelectContent>

                                  <Input
                                    disabled
                                    value={getDimensions(field.value)?.at(0)}
                                    className="w-[70px] text-center"
                                  />
                                  <X
                                    width={20}
                                    height={20}
                                    className="text-muted-foreground"
                                    strokeWidth={3}
                                  />
                                  <Input
                                    disabled
                                    value={getDimensions(field.value)?.at(1)}
                                    className="w-[70px] text-center"
                                  />
                                </div>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Select the size of the generated image.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between">
                        <Button
                          type="reset"
                          onClick={() => form.reset()}
                          variant={"secondary"}
                        >
                          Reset
                        </Button>
                        <SheetTrigger asChild>
                          <Button>Save & Exit</Button>
                        </SheetTrigger>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </form>
        </Form>
      </div>
    </>
  );
}
