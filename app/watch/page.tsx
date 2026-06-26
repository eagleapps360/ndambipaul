import { permanentRedirect } from "next/navigation";

export default function WatchPage() {
  permanentRedirect("/livestreams");
}
