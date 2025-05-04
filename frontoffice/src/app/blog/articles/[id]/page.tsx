// app/blog/articles/[id]/page.tsx
import { use } from 'react';

interface Props {
  params: { id: string };
}

export default function ArticlePage({ params }: Props) {
  const { id } = params;

  return (
    <div>
      <h1>Article #{id}</h1>
      <p>Contenu dynamique de l'article {id}.</p>
    </div>
  );
}