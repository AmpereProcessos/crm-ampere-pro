import Image from 'next/image';
type AvatarProps = {
  url?: string;
  width: number;
  height: number;
  fallback: string;
  radiusPercentage?: string;
  backgroundColor?: string;
};
function Avatar({ url, width, height, fallback, radiusPercentage = '100%', backgroundColor = 'transparent' }: AvatarProps) {
  if (!url)
    return (
      <div
        className='flex items-center justify-center rounded-full bg-primary/70'
        style={{
          width: width,
          height: height,
          maxHeight: height,
          maxWidth: width,
          minHeight: height,
          minWidth: width,
        }}
      >
        <p style={{ fontSize: width * 0.4 }} className='font-bold text-primary-foreground'>
          {fallback || 'U'}
        </p>
      </div>
    );
  return (
    <div
      style={{
        width: width,
        height: height,
        borderRadius: radiusPercentage,
        backgroundColor: backgroundColor,
      }}
      className='relative flex items-center justify-center'
    >
      <Image src={url} alt='Avatar' fill={true} style={{ borderRadius: radiusPercentage }} />
    </div>
  );
}

export default Avatar;
