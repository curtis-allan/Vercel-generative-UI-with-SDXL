import { FastForward } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

export default function Navbar() {
  return (
    <div className="flex w-fit mx-auto px-9 items-center justify-center relative">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight p-2">
        Gen<span className="mx-1 font-normal text-red-400">|R8</span>
      </h1>
      <Badge variant={"outline"} className="absolute top-0 right-0">
        v1.0
      </Badge>
    </div>
  );
}
