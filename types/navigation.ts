export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type BottomTabParamList = {
    Home: undefined;
    Resources: undefined;
    Rewards: undefined;
    Tools: undefined;
    Profile: undefined;
    Settings: undefined
    Curriculum: {
        selectedCategories: string[];
    };
};

export type DrawerParamList = {
    Main: undefined;
};

export type RootStackParamList = AuthStackParamList & {
    Main: undefined;
};