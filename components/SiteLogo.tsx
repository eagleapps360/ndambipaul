import Image from "next/image";

type SiteLogoProps = {
  label: string;
  size?: number;
  priority?: boolean;
};

export default function SiteLogo({ label, size = 48, priority = false }: SiteLogoProps) {
  return (
    <>
      <Image
        src="/images/pa-ndambi-logo-circle.png"
        alt="Pa Ndambi Paul Angemba"
        width={size}
        height={size}
        priority={priority}
        className="siteLogoPortrait"
      />
      <span className="siteLogoText">{label}</span>
    </>
  );
}
