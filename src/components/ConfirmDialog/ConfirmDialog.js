// src/components/ConfirmDialog/ConfirmDialog.js
import React from 'react';
import styled from 'styled-components';
import Modal from '../Modal/Modal';

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: ${props => props.danger ? props.theme.colors.danger : props.theme.colors.secondary};
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.danger ? props.theme.colors.dangerHover || '#d32f2f' : '#444'};
  }
`;

const Message = styled.p`
  margin: 20px 0;
  font-size: 16px;
  color: ${props => props.theme.colors.text};
`;

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <Message>{message}</Message>
      <ButtonGroup>
        <Button danger onClick={onConfirm}>Eliminar</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </ButtonGroup>
    </Modal>
  );
};

export default ConfirmDialog;