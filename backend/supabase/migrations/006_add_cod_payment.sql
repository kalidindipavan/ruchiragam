-- Migration: 006_add_cod_payment.sql
-- Adds Cash on Delivery (COD) to the payment_provider ENUM

ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'cod';
