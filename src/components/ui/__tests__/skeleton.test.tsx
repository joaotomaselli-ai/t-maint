import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Skeleton } from '../skeleton';

describe('Skeleton Component', () => {
  it('renders skeleton element with shimmer animation class', () => {
    const { container } = render(<Skeleton className="h-6 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.className).toContain('skeleton-shimmer');
    expect(el.className).toContain('h-6');
    expect(el.className).toContain('w-32');
  });
});
