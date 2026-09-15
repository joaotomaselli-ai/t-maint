import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MachineQRModal } from '../MachineQRModal';

describe('MachineQRModal Component', () => {
  it('renders machine name and client info when opened', () => {
    render(
      <MachineQRModal
        isOpen={true}
        onClose={vi.fn()}
        machineName="Torno CNC Okuma LB3000"
        clientName="Metalúrgica Vale"
        tagNumber="CNC-001"
      />
    );

    expect(screen.getByText(/Etiqueta Machine QR Tag/i)).toBeTruthy();
    expect(screen.getByText(/Torno CNC Okuma LB3000/i)).toBeTruthy();
    expect(screen.getByText(/Metalúrgica Vale • TAG: CNC-001/i)).toBeTruthy();
    expect(screen.getByText(/Imprimir Etiqueta/i)).toBeTruthy();
  });

  it('does not render content when isOpen is false', () => {
    render(
      <MachineQRModal
        isOpen={false}
        onClose={vi.fn()}
        machineName="Centro Fanuc"
        clientName="Empresa X"
      />
    );

    expect(screen.queryByText(/Etiqueta Machine QR Tag/i)).toBeNull();
  });
});
