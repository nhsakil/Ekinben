import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { validatePhone, validatePostalCode } from '../utils/validators.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone_number, profile_image_url, date_of_birth, gender, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, phone, dateOfBirth, gender } = req.body;

    if (phone && !validatePhone(phone)) {
      throw new AppError('Invalid phone number format', 400, 'INVALID_PHONE');
    }

    const updateData = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone) updateData.phone_number = phone;
    if (dateOfBirth) updateData.date_of_birth = dateOfBirth;
    if (gender) updateData.gender = gender;

    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update profile', 500, 'UPDATE_ERROR');
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const {
      label,
      firstName,
      lastName,
      phoneNumber,
      streetAddress,
      apartmentSuite,
      city,
      stateProvince,
      postalCode,
      country,
      isDefaultShipping,
      isDefaultBilling
    } = req.body;

    // Validation
    if (!firstName || !lastName || !phoneNumber || !streetAddress || !city || !country) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    if (!validatePhone(phoneNumber)) {
      throw new AppError('Invalid phone number format', 400, 'INVALID_PHONE');
    }

    if (!validatePostalCode(postalCode)) {
      throw new AppError('Invalid postal code', 400, 'INVALID_POSTAL_CODE');
    }

    // If setting as default, unset other defaults
    if (isDefaultShipping) {
      await supabase
        .from('addresses')
        .update({ is_default_shipping: false })
        .eq('user_id', userId);
    }

    if (isDefaultBilling) {
      await supabase
        .from('addresses')
        .update({ is_default_billing: false })
        .eq('user_id', userId);
    }

    const { data: address, error } = await supabase
      .from('addresses')
      .insert([{
        user_id: userId,
        label: label || 'Home',
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        street_address: streetAddress,
        apartment_suite: apartmentSuite,
        city,
        state_province: stateProvince,
        postal_code: postalCode,
        country,
        is_default_shipping: isDefaultShipping || false,
        is_default_billing: isDefaultBilling || false
      }])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create address', 500, 'CREATE_ERROR');
    }

    res.status(201).json({
      success: true,
      data: address,
      message: 'Address created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getAddresses = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch addresses', 500, 'FETCH_ERROR');
    }

    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { addressId } = req.params;
    const updates = req.body;

    // Verify ownership
    const { data: address } = await supabase
      .from('addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (!address || address.user_id !== userId) {
      throw new AppError('Address not found', 404, 'NOT_FOUND');
    }

    // Validate phone if provided
    if (updates.phoneNumber && !validatePhone(updates.phoneNumber)) {
      throw new AppError('Invalid phone number format', 400, 'INVALID_PHONE');
    }

    // Validate postal code if provided
    if (updates.postalCode && !validatePostalCode(updates.postalCode)) {
      throw new AppError('Invalid postal code', 400, 'INVALID_POSTAL_CODE');
    }

    // Transform field names
    const updateData = {};
    if (updates.label) updateData.label = updates.label;
    if (updates.firstName) updateData.first_name = updates.firstName;
    if (updates.lastName) updateData.last_name = updates.lastName;
    if (updates.phoneNumber) updateData.phone_number = updates.phoneNumber;
    if (updates.streetAddress) updateData.street_address = updates.streetAddress;
    if (updates.apartmentSuite) updateData.apartment_suite = updates.apartmentSuite;
    if (updates.city) updateData.city = updates.city;
    if (updates.stateProvince) updateData.state_province = updates.stateProvince;
    if (updates.postalCode) updateData.postal_code = updates.postalCode;
    if (updates.country) updateData.country = updates.country;

    if (updates.isDefaultShipping !== undefined) {
      updateData.is_default_shipping = updates.isDefaultShipping;
      if (updates.isDefaultShipping) {
        await supabase
          .from('addresses')
          .update({ is_default_shipping: false })
          .eq('user_id', userId);
      }
    }

    if (updates.isDefaultBilling !== undefined) {
      updateData.is_default_billing = updates.isDefaultBilling;
      if (updates.isDefaultBilling) {
        await supabase
          .from('addresses')
          .update({ is_default_billing: false })
          .eq('user_id', userId);
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', addressId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update address', 500, 'UPDATE_ERROR');
    }

    res.json({
      success: true,
      data: updated,
      message: 'Address updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { addressId } = req.params;

    // Verify ownership
    const { data: address } = await supabase
      .from('addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (!address || address.user_id !== userId) {
      throw new AppError('Address not found', 404, 'NOT_FOUND');
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      throw new AppError('Failed to delete address', 500, 'DELETE_ERROR');
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress
};
