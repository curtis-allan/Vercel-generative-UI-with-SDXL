import Image from "next/image";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

const ImageCard = ({ newImage }: any) => {
  return (
    <Card className="grid items-center gap-4">
      <CardHeader>
        <CardTitle>Prompt</CardTitle>
        <CardDescription>
          <i className="tracking-tight">"{newImage.prompt}"</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full flex justify-center">
        <div className="max-w-xl">
          <Image
            src={newImage.images[0].url}
            alt={`Image generated from the prompt: ${newImage.prompt}`}
            width={1024}
            height={1024}
            className="object-cover rounded-md"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between w-full">
        <Button>Like</Button>
        <Button variant={"destructive"}>Delete</Button>
      </CardFooter>
    </Card>
  );
};

export default ImageCard;
