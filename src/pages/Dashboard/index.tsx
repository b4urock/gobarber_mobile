import React, { useCallback, useEffect, useState } from 'react';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import {  Button } from 'react-native';

import IProvider from '../../dtos/IProvider';

import {
	Container,
	Header,
	HeaderTitle,
	UserName,
	ProfileButton,
	UserAvatar,
	ProvidersList,
	ProviderContainer,
	ProviderAvatar,
	ProviderInfo,
	ProviderName,
	ProviderMeta,
	ProviderMetaText,
	ProvidersListTitle
 } from './styles';

const Dashboard: React.FC = () => {
	const [providers, setProviders] = useState<IProvider[]>([]);

	const { signOut, user } = useAuth();
	const { navigate } = useNavigation();

	const navigateToProfile = useCallback(() => {
		navigate('Profile');
	}, [navigate]);

	const navigatetoCreateAppointment = useCallback((providerId: string) => {
		navigate('CreateAppointment', { providerId });
	}, [navigate]);

	useEffect(() => {
		api.get('providers').then((response) => {
			setProviders(response.data);
		});
	}, []);

	//const { signOut } = useAuth();
//	<Button title="Sair" onPress={signOut} />

	return (
		<Container>
			<Header>
			<Button title="Sair" onPress={signOut} />
				<HeaderTitle>
					Bem vindo, {"\n"}
					<UserName>{user.name}</UserName>
				</HeaderTitle>

				<ProfileButton  onPress={navigateToProfile}>
					<UserAvatar source={{ uri: user.avatar_url }} />
				</ProfileButton>
			</Header>

			<ProvidersList
				data={providers}
				keyExtractor={(provider) => provider.id}
				ListHeaderComponent={
					<ProvidersListTitle>Cabelereiros</ProvidersListTitle>
				}
				ListEmptyComponent={
					<ProvidersListTitle>Nenhum prestador disponível</ProvidersListTitle>
				}
				renderItem={({ item: provider }) => (
					<ProviderContainer
						onPress={() => navigatetoCreateAppointment(provider.id)}
					>
						<ProviderAvatar source={{ uri: provider.avatar_url }} />

						<ProviderInfo>
							<ProviderName>{provider.name}</ProviderName>

							<ProviderMeta>
								<Icon name="calendar" size={14} color="#ff9000" />
								<ProviderMetaText>Segunda à sexta</ProviderMetaText>
							</ProviderMeta>

							<ProviderMeta>
								<Icon name="clock" size={14} color="#ff9000" />
								<ProviderMetaText>8h às 18h</ProviderMetaText>
							</ProviderMeta>
						</ProviderInfo>
					</ProviderContainer>
				)
				}/>

		</Container>
	);
};

export default Dashboard;
