import type { Meta, StoryObj } from '@storybook/react';
import CharacterSheet from './CharacterSheet';

const meta = {
  title: 'Tormenta20/CharacterSheet',
  component: CharacterSheet,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CharacterSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};