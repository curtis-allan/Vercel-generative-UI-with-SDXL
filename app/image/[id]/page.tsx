import Image from "next/image";

export default function Page({
  props,
  params,
}: {
  params: { id: string };
  props: { url: string };
}) {
  return (
    <div>
      <Image fill src={props.url} alt={params.id} />
    </div>
  );
}
