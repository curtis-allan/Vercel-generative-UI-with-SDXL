"use client";

import GenerativeView from "@/components/generative-view";
import RealTimeView from "@/components/realtime-view";
import TextToImage from "@/components/text2image-view";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <Tabs defaultValue="textToImage" className="container">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="textToImage">Text to image</TabsTrigger>
        <TabsTrigger value="generative">Generative UI</TabsTrigger>
        <TabsTrigger value="realtime">
          Realtime{" "}
          <Badge variant={"default"} className="ml-2">
            New
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="generative">
        <GenerativeView />
      </TabsContent>
      <TabsContent
        forceMount
        className="data-[state=inactive]:hidden"
        value="realtime"
      >
        <RealTimeView />
      </TabsContent>
      <TabsContent
        forceMount
        value="textToImage"
        className="data-[state=inactive]:hidden"
      >
        <TextToImage />
      </TabsContent>
    </Tabs>
  );
}
