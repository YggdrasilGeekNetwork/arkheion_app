import type { MetaFunction } from "@remix-run/node";
import CharacterSheet from '../components/tormenta20/CharacterSheet'

export const meta: MetaFunction = () => {
  return [
    { title: "Character Sheet" },
    { name: "description", content: "Tormenta20 Character Sheet" },
  ];
};

export default function Index() {
  return <CharacterSheet />;
}
