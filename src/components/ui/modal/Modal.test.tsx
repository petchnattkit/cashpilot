import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '.';

describe('Modal', () => {
  beforeEach(() => {
    // Clear mocks and reset body overflow
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => { }}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => { }}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should close when overlay is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    // Click the overlay (presentation role)
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close when ESC key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should lock body scroll when open', () => {
    render(
      <Modal isOpen={true} onClose={() => { }}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should unlock body scroll when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => { }}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={() => { }}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('unset');
  });

  it('should not close when clicking inside the modal content', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );

    const content = screen.getByRole('dialog');
    fireEvent.click(content);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should trap focus inside the modal', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={() => { }}>
        <button>Button 1</button>
        <button>Button 2</button>
      </Modal>
    );

    const button1 = screen.getByText('Button 1');
    const button2 = screen.getByText('Button 2');
    const closeButton = screen.getByLabelText('Close');

    // Initial focus should be on the first focusable element (close button usually first, but implemented as close button then children)
    // In my implementation close button is absolute but rendered before children?
    // Let's check implementation order. Close button is first in DOM order inside modal div.

    expect(document.activeElement).toBe(closeButton);

    await user.tab();
    expect(document.activeElement).toBe(button1);

    await user.tab();
    expect(document.activeElement).toBe(button2);

    await user.tab();
    expect(document.activeElement).toBe(closeButton); // Loops back
  });
});

describe('Modal Subcomponents', () => {
  it('should render header, title, content, footer correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => { }}>
        <ModalHeader>
          <ModalTitle>My Title</ModalTitle>
        </ModalHeader>
        <ModalContent>My Content</ModalContent>
        <ModalFooter>My Footer</ModalFooter>
      </Modal>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Content')).toBeInTheDocument();
    expect(screen.getByText('My Footer')).toBeInTheDocument();
  });
});
