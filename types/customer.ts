/**
 * Customer Types (Admin)
 * Matches backend schema
 */

/**
 * Customer (from user table where role = 'customer')
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  showAddress?: boolean | null;
  emailVerified: boolean;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update customer input
 */
export interface UpdateCustomerInput {
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  showAddress?: boolean;
}
