import type { Meta, StoryObj } from '@storybook/react';
import ProgressCard from './ProgressCard';

const meta = {
  title: 'Tormenta20/ProgressCard',
  component: ProgressCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    current: { control: 'number' },
    max: { control: 'number' },
  },
} satisfies Meta<typeof ProgressCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Health: Story = {
  args: {
    title: 'Pontos de Vida',
    current: 20,
    max: 25,
  },
};

export const Mana: Story = {
  args: {
    title: 'Pontos de Mana',
    current: 10,
    max: 15,
  },
};