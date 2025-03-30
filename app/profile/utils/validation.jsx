import * as Yup from 'yup';
import {
  AlertIOS,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
export const changePasswordValid = {
    initial: {
      oldPassword: '',
      newPassword: '',
      passwordConfirmation: '',
    },
    validationSchema: Yup.object().shape({
      oldPassword: Yup.string().required('Mật khẩu cũ không được để trống'),
      newPassword: Yup.string()
        .required('Mật khẩu mới không được để trống')
        .min(8, 'Mật khẩu phải từ 8-50 ký tự')
        .max(50, 'Mật khẩu phải từ 8-50 ký tự')
        .notOneOf(
          [Yup.ref('oldPassword'), null],
          'Mật khẩu mới không trùng với mật khẩu cũ',
        ),
      passwordConfirmation: Yup.string()
        .required('Không được để trống')
        .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu không khớp'),
    }),
  };
  export const logoutAllValid = {
    initial: {
      password: '',
    },
    validationSchema: Yup.object().shape({
      password: Yup.string().required('Mật khẩu không được để trống'),
    }),
  };
  export const userProfileValid = {
    initial: {
      name: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required('Tên không được để trống')
        .matches(/^(?!\s+$).+/, 'Không hợp lệ')
        .max(30, 'Tối đa 30 kí tự'),
    }),
  };

  