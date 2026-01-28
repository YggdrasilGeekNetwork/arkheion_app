import type { Meta, StoryObj } from '@storybook/react';
import StatCard from './StatCard';

const meta = {
  title: 'Tormenta20/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Defense: Story = {
  args: {
    title: 'Defesa',
    value: 18,
    subtitle: '• Armadura<br />• Escudo<br />• Outros',
  },
};

export const Initiative: Story = {
  args: {
    title: 'Iniciativa',
    value: '+3',
    showRoll: true,
  },
};