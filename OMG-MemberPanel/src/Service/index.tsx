const images = import.meta.glob<{ default: string }>(
  '../assets/images/**/*',
  { eager: true }
);

export const dynamicImage = (image: string | undefined) => {
  if (!image) return '';
  const match = Object.entries(images).find(([path]) =>
    path.endsWith(`/${image}`)
  );
  return match?.[1].default ?? '';
};
