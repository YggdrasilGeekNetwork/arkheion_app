import type { Meta, StoryObj } from '@storybook/react';
import ResistanceCard from './ResistanceCard';

const meta = {
  title: 'Tormenta20/ResistanceCard',
  component: ResistanceCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResistanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    resistances: [
      { value: 5, name: 'Fortitude' },
      { value: 3, name: 'Reflexos' },
      { value: 2, name: 'Vontade' },
    ],
  },
};