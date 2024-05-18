import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";

const ImageCard = ({ newImage }: any) => {
  return (
    <Card className="grid items-center gap-2">
      <CardHeader>
        <CardDescription>
          <i className="tracking-tight">{`"${newImage.prompt}"`}</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full flex justify-center">
        <div className="max-w-lg">
          <Image
            src={newImage.images[0].url}
            alt={`Image generated from the prompt: ${newImage.prompt}`}
            width={1024}
            height={1024}
            className="object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
