import { Input } from "@/components/ui/input";
import { Atom, DiamondMinus, Send, Settings2, X } from "lucide-react";
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import * as fal from "@fal-ai/serverless-client";
import { cn, getDimensions } from "@/lib/utils";
import { AspectRatio } from "./ui/aspect-ratio";
import { RequestLog } from "@fal-ai/serverless-client/src/types";
import Spinner from "./spinner";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { ScrollArea } from "./ui/scroll-area";
import { Dialog } from "./ui/dialog";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const FormSchema = z.object({
  model_name: z.string(),
  prompt: z.string().min(1, { message: "Please enter a prompt." }),
  negative_prompt: z.string().max(1500, {
    message: "Negative Prompt must not exceed 1500 characters.",
  }),
  image_size: z.string(),
  num_inference_steps: z
    .number({ required_error: "Please enter a number." })
    .positive({ message: "Must be a positive number." })
    .int({ message: "Must be a whole number" })
    .min(1, { message: "Must not be lower than 1" })
    .max(12, { message: "Must not exceed 12." })
    .or(z.string())
    .pipe(
      z.coerce
        .number({ required_error: "Please enter a number." })
        .positive({ message: "Must be a positive number." })
        .int({ message: "Must be a whole number." })
        .min(1, { message: "Must be a minimum of 1 step." })
        .max(12, { message: "Cannot exceed 12 steps." })
    ),
  guidance_scale: z
    .number({ required_error: "Please enter a number." })
    .positive({ message: "Must be a positive number." })
    .max(2, { message: "Must not exceed 2 steps." })
    .or(z.string())
    .pipe(
      z.coerce
        .number({ required_error: "Please enter a number." })
        .positive({ message: "Must be a positive number." })
        .min(1, { message: "Must be a minimum of 1 step." })
        .max(5, { message: "Cannot exceed 5 steps." })
    ),
  //   loras: z.optional(z.string().url()),
  //   embeddings: z.optional(z.string().url()),
  //   seed: z.optional(z.number()),
  expand_prompt: z.boolean(),
});

export default function TextToImage() {
  const [image, setImage] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updates, setUpdates] = useState<string>("");
  const [dimensions, setDimensions] = useState<number[]>([]);
  const [progress, setProgress] = useState<string>("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      model_name: "Lykon/dreamshaper-xl-lightning",
      prompt: "",
      negative_prompt:
        "(octane render, render, drawing, anime, bad photo, text, bad photography:1.3), (worst quality, low quality, blurry:1.2), (bad teeth, deformed teeth, deformed lips), (bad anatomy, bad proportions:1.1), (deformed iris, deformed pupils), (deformed eyes, bad eyes), (deformed face, ugly face, bad face), (deformed hands, bad hands, fused fingers, text), morbid, mutilated, mutation, disfigured",
      image_size: "square_hd",
      num_inference_steps: 5,
      guidance_scale: 2,
      //   loras: "",
      //   embeddings: "",
      expand_prompt: false,
      //   seed: 9999999,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setImage(null);

    const newImage = await fal.subscribe("fal-ai/lightning-models", {
      input: {
        ...data,
        num_images: 1,
        sync_mode: true,
        enable_safety_checker: false,
      },
      logs: true,
      pollInterval: 500,
      onQueueUpdate: (update) => {
        setUpdates(update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs!.map((log) => setProgress(log.message));
        }
      },
    });

    setDimensions(getDimensions(data.image_size)!);
    setUpdates("");
    setProgress("");
    setImage(newImage || null);
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex h-[66.5vh] sm:h-[72.5vh] items-center justify-center border-2 rounded-md p-2">
        <div className="grid place-items-center container relative overflow-hidden w-full h-full">
          {image ? (
            <Image
              //@ts-ignore
              src={image?.images[0]?.url}
              className="object-contain rounded-md"
              alt="image generation"
              fill
              priority
            />
          ) : (
            <div
              className={cn(
                "flex flex-col items-center bg-accent justify-center h-full w-full",
                isLoading ? "animate-pulse" : ""
              )}
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-2"
                )}
              >
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
            noValidate
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
                    Generate <Atom size={20} strokeWidth={1.75} />
                  </div>
                )}
              </Button>
            </div>
            <Sheet modal={false}>
              <SheetTrigger asChild>
                <Button variant={"outline"} size={"icon"}>
                  <Settings2 className="h-[1.2rem] w-[3rem]" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-scroll scrollbar-none">
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
                            key={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a model to use" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Lykon/dreamshaper-xl-lightning">
                                DreamshaperXL
                              </SelectItem>
                              <SelectItem value="SG161222/RealVisXL_V4.0_Lightning">
                                RealVisXL v4.0
                              </SelectItem>
                              <SelectItem value="RunDiffusion/Juggernaut-XL-Lightning">
                                JuggernautXL
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
                              Enter negative prompts. (eg. bad hands)
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
                                key={field.value}
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
                      <FormField
                        control={form.control}
                        name="expand_prompt"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <FormLabel>Expand Prompt</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <FormDescription>
                              Enable to expand your prompt with additional text.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="num_inference_steps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Num Inference Steps</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Slider
                                  defaultValue={[field.value]}
                                  onValueChange={(val) => {
                                    field.onChange(val[0]);
                                  }}
                                  max={12}
                                  step={1}
                                  min={1}
                                  value={[field.value]}
                                  key={Number(field.ref(null))}
                                />
                                <Input
                                  type="number"
                                  min={1}
                                  max={12}
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    e.target.validity.valid &&
                                    field.onChange(e.target.value)
                                  }
                                  className="w-[70px]"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guidance_scale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guidance Scale (CFG)</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Slider
                                  defaultValue={[field.value]}
                                  onValueChange={(val) => {
                                    field.onChange(val[0]);
                                  }}
                                  max={2}
                                  min={0}
                                  step={0.1}
                                  value={[field.value]}
                                  key={Number(field.ref(null))}
                                />
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  min={0}
                                  max={2}
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    e.target.validity.valid &&
                                    field.onChange(e.target.value)
                                  }
                                  className="w-[70px]"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <SheetFooter>
                        <div className="flex w-full justify-between">
                          <Button
                            type="reset"
                            onClick={() => form.reset()}
                            variant={"secondary"}
                          >
                            Reset
                          </Button>
                          <SheetClose asChild>
                            <Button>Close</Button>
                          </SheetClose>
                        </div>
                      </SheetFooter>
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
