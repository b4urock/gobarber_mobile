import React, { useCallback, useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import IProvider from '../../dtos/IProvider';

import {
	Container,
	Header,
	BackButton,
	HeaderTitle,
	UserAvatar,
	ProvidersList,
	ProvidersListContainer,
	ProviderContainer,
	ProviderAvatar,
	ProviderName,
} from './styles';



interface RouteParamns {
	providerId: string;
}


const CreateAppointment: React.FC = () => {
	const { user } = useAuth();
	const route = useRoute();
	const { goBack } = useNavigation();

	const routeParams = route.params as RouteParamns;
	const [providers, setProviders] = useState<IProvider[]>([]);
	const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId);

	useEffect(() => {
		api.get('providers').then((response) => {
			setProviders(response.data);
		});
	}, []);

	const navigateBack = useCallback((id: string) => {
		goBack();
	}, [goBack]);

	const handleSelectProvider = useCallback((providerId: string) => {
		setSelectedProvider(providerId);
	},[]);

	return (
		<Container>
			<Header>
				<BackButton onPress={navigateBack}>
					<Icon name ="chevron-left" size={24} color="#999591" />
				</BackButton>

				<HeaderTitle>Cabeleireiros</HeaderTitle>

				<UserAvatar source={{ uri: user.avatar_url }} />
			</Header>

			<ProvidersListContainer>
				<ProvidersList
					horizontal
					showsHorizontalScrollIndicator={false}
					data={providers}
					keyExtractor={(provider) => provider.id}
					renderItem={({ item : provider }) => (
						<ProviderContainer onPress={() => handleSelectProvider(provider.id)}
							selected={provider.id === selectedProvider}>
							<ProviderAvatar source={{ uri: provider.avatar_url }} />
							<ProviderName
								selected={provider.id === selectedProvider}>
								{provider.name}
							</ProviderName>
						</ProviderContainer>
					)}
				/>
			</ProvidersListContainer>

		</Container>
	);
};

export default CreateAppointment;