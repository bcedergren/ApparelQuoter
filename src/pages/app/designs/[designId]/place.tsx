import React from 'react';
import { useRouter } from 'next/router';
import PlacementEditor from '@/components/app/designs/PlacementEditor';

const PlaceDesignPage: React.FC = () => {
  const router = useRouter();
  const { designId } = router.query as { designId?: string };
  if (!designId) return null;
  return <PlacementEditor designId={designId} />;
};

export default PlaceDesignPage;


