import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders button with label and reacts to click', () => {
  const handleClick = jest.fn();
  const { getByText } = render(<Button label="Click me" onClick={handleClick} />);
  
  const buttonElement = getByText(/click me/i);
  
  expect(buttonElement).toBeInTheDocument();
  
  fireEvent.click(buttonElement);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});