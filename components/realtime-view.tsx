import { Input } from "@/components/ui/input";
import * as fal from "@fal-ai/serverless-client";
import Image from "next/image";
import { useState } from "react";
import { ModeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const seed = Math.floor(Math.random() * 10000000).toFixed(0);

const baseArgs = {
  _force_msgpack: new Uint8Array([]),
  seed: Number(seed),
  num_images: 1,
  enable_safety_checker: false,
  sync_mode: true,
};

export default function RealTimeView() {
  const [inputValue, setInputValue] = useState<string>("");
  const [imgURL, setImgURL] = useState<string>("");

  const { send } = fal.realtime.connect("fal-ai/fast-lightning-sdxl", {
    connectionKey: "lightning-sdxl",
    throttleInterval: 128,
    onResult: (result) => {
      const blob = new Blob([result.images[0].content], { type: "image/jpeg" });
      const blobURL = URL.createObjectURL(blob);

      setImgURL(blobURL);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleChange = (prompt: string) => {
    setInputValue(prompt);
    send({ ...baseArgs, prompt });
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center border rounded-md p-3">
        <div className="max-w-xl">
          {imgURL ? (
            <Image
              src={imgURL}
              className="object-contain"
              width={1024}
              height={1024}
              alt="image generation"
              priority
            />
          ) : (
            <div className="h-[512px] w-[512px] bg-accent" />
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-t-xl border-t inset-x-0 bottom-0 fixed">
        <div className="flex gap-4 w-full">
          <ModeToggle />
          <Input
            type="text"
            value={inputValue}
            placeholder="Start typing to generate in real time."
            className="bg-muted/60"
            onChange={(e) => {
              handleChange(e.target.value);
            }}
          />
        </div>
      </div>
    </>
  );
}
