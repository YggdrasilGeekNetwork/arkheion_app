import type { Meta, StoryObj } from '@storybook/react';
import AttributeField from './AttributeField';

const meta = {
  title: 'Tormenta20/AttributeField',
  component: AttributeField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
} satisfies Meta<typeof AttributeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'FOR',
    value: 10,
  },
};

export const Small: Story = {
  args: {
    label: 'DES',
    value: 8,
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    label: 'INT',
    value: 15,
    size: 'large',
  },
};