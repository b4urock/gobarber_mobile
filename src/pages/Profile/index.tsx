import React, { useRef, useCallback } from 'react';
import {
	View,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	TextInput,
	Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-picker';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
	Container,
	Title,
	BackButton,
	UserAvatarButton,
	UserAvatar,
 }
	from './styles';

import { useAuth } from '../../context/AuthContext';

interface ProfileFormData {
	name: string;
	email: string;
	old_password: string;
	password: string;
	password_confirmation: string;

}

const SignUp: React.FC = () => {
	const { user, updateUser } = useAuth();

	const formRef = useRef<FormHandles>(null);
	const navigation = useNavigation();

	const emailInputRef = useRef<TextInput>(null);
	const oldPasswordInputRef = useRef<TextInput>(null);
	const newPasswordInputRef = useRef<TextInput>(null);
	const confirmPasswordInputRef = useRef<TextInput>(null);

	const handleSignUp = useCallback(
		async (data: ProfileFormData) => {
			try {
				formRef.current?.setErrors({});

				const schema = Yup.object().shape({
					name: Yup.string().required('Digite seu nome'),
					email: Yup.string().required('Digite seu e-mail').email('Digite um e-email válido'),
					old_password: Yup.string(),
					password: Yup.string().when('old_password', {
						is: val => !!val.length,
						then: Yup.string()
							.required('Digite sua nova senha')
							.min(8, 'A senha deve ter no mínimo 8 caracteres')
							.matches(
								/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
								"A senha deve ter no mínimo 8 caracteres sendo: Um maiúsculo, um minúsculo, um número e um caracter especial"
							),
					}),
					password_confirmation: Yup.string().when('old_password', {
						is: val => !!val.length,
						then: Yup.string()
							.required('Digite sua nova senha novamente')
							.oneOf([Yup.ref('password'), null],'Senha e confirmação não são iguais'),
						}),
				});

				await schema.validate(data, {
					abortEarly: false,
				});

				const {
					name,
					email,
					old_password,
					password,
					password_confirmation ,
				} = data;

				const formData =  {
					name,
					email,
					...(old_password
						? {
								old_password,
								password,
								password_confirmation,
							}
						: {})
				};


				const response = await api.put('profile', formData);

				updateUser(response.data);

				Alert.alert('Perfil atualizado com sucesso!');

				navigation.goBack;

			} catch (err) {
				if (err instanceof Yup.ValidationError) {
					const errors = getValidationErrors(err);

					formRef.current?.setErrors(errors);

					return;

				}

			Alert.alert('Erro na atualização do perfil',
				 'Ocorreu um erro ao atualizar o seu perfil, tente novamente.'
			);
		}
	},[navigation, updateUser]);

	const handleUpdateAvatar = useCallback(() => {
		ImagePicker.showImagePicker({
			title: 'Selecione um avatar',
			cancelButtonTitle: 'Cancelar',
			takePhotoButtonTitle: 'Usar câmera',
			chooseFromLibraryButtonTitle: 'Escolher foto da galeria'
		},
		(response) => {
			if (response.didCancel) {
				return;
			}

			if (response.error) {
				Alert.alert('Erro ao atualizar seu avatar.');
				return;
			}

			const data = new FormData();

			data.append('avatar', {
				name: `${user.id}.jpg`,
				type: 'image/jpeg',
				uri: response.uri,
			});

			api.patch('users/avatar', data).then(apiResponse => {
				updateUser(apiResponse.data);
			});
		},
	 );
	}, [updateUser, user.id]);

	const handleGoBack = useCallback(() => {
		navigation.goBack();
	}, [navigation]);

	return (
		<>
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			enabled
		>
			<ScrollView
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ flex: 1 }}
			>
				<Container>
					<BackButton onPress={handleGoBack}>
						<Icon name="chevron-left" size={58} color="#999591" />
					</BackButton>

					<UserAvatarButton onPress={handleUpdateAvatar}>
						<UserAvatar source={{ uri: user.avatar_url }} />
					</UserAvatarButton>

					<View>
						<Title>
							Meu Perfil
						</Title>
					</View>

					<Form initialData={user} ref={formRef} onSubmit={handleSignUp}>
						<Input
							autoCapitalize="words"
							name="name"
							icon="user"
							placeholder="Nome"
							returnKeyType="next"
							onSubmitEditing={() => {
								emailInputRef.current?.focus()
							}}
					  />

						<Input
							ref={emailInputRef}
							keyboardType="email-address"
							autoCorrect={false}
							autoCapitalize="none"
							name="email"
							icon="mail"
							placeholder="E-mail"
							returnKeyType="next"
							onSubmitEditing={() => {
								oldPasswordInputRef.current?.focus()
							}}
						/>

						<Input
							ref={oldPasswordInputRef}
							secureTextEntry
							name="old_password"
							icon="lock"
							placeholder="Senha atual"
							textContentType="newPassword"
							returnKeyType="next"
							containerStyle={{ marginTop: 16 }}
							caretHidden={true}
							onSubmitEditing={() => {
								newPasswordInputRef.current?.focus()
							}}
						/>

						<Input
							ref={newPasswordInputRef}
							secureTextEntry
							name="password"
							icon="lock"
							placeholder="Nova Senha"
							textContentType="newPassword"
							returnKeyType="next"
							caretHidden={true}
							onSubmitEditing={() => {
								confirmPasswordInputRef.current?.focus()
							}}
						/>

						<Input
							ref={confirmPasswordInputRef}
							secureTextEntry
							name="password_confirmation"
							icon="lock"
							placeholder="Confirmar Senha"
							textContentType="newPassword"
							returnKeyType="send"
							caretHidden={true}
							onSubmitEditing={() =>
								formRef.current?.submitForm()}
						/>

						<Button
							onPress={() => formRef.current?.submitForm()}
							>
								Confirmar mudanças
							</Button>
						</Form>

					</Container>
				</ScrollView>
			</KeyboardAvoidingView>

		</>

	);
};

export default SignUp;
