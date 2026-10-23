import { Navigate, useParams } from 'react-router-dom';
import { CONTENT_DEFS } from './contentConfig';
import { ContentManager } from './ContentManager';
import { ContentEditor } from './ContentEditor';
import type { ContentEntity } from '@/lib/adminApi';

function resolveDef(entity: string | undefined) {
  if (entity && entity in CONTENT_DEFS) return CONTENT_DEFS[entity as ContentEntity];
  return null;
}

export function ContentListRoute() {
  const { entity } = useParams();
  const def = resolveDef(entity);
  if (!def) return <Navigate to="/admin" replace />;
  return <ContentManager def={def} />;
}

export function ContentEditRoute() {
  const { entity, id } = useParams();
  const def = resolveDef(entity);
  if (!def) return <Navigate to="/admin" replace />;
  return <ContentEditor def={def} id={id} />;
}
