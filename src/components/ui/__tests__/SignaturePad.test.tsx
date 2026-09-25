import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SignaturePad } from '../SignaturePad';

describe('SignaturePad Component', () => {
  it('renders the label, canvas, and always displays the Limpar button', () => {
    const onChange = vi.fn();
    render(<SignaturePad label="Assinatura do Técnico" onChange={onChange} value="" />);

    expect(screen.getByText('Assinatura do Técnico')).toBeTruthy();
    expect(screen.getByText('Assine no quadro acima')).toBeTruthy();
    
    // The "Limpar" button must be rendered
    const clearBtn = screen.getByRole('button', { name: /Limpar/i });
    expect(clearBtn).toBeTruthy();
  });

  it('triggers onChange with empty string when clicking Limpar button', () => {
    const onChange = vi.fn();
    render(<SignaturePad label="Assinatura do Cliente" onChange={onChange} value="data:image/png;base64,mock" />);

    const clearBtn = screen.getByRole('button', { name: /Limpar/i });
    fireEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith('');
  });
});
