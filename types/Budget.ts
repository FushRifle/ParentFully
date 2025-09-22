import { RootStackParamList } from "@/navigation/MainNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type ExpenseCardBaseProps = {
    expenseId: string;
    title: string;
    amount: number;
    currency?: string;
    childName: string;
    date: string;
    category: string;
    categoryColor: string;
    status: "Pending Approval" | "Approved" | "Rejected" | "Paid" | "Pending" | "Reimburser";
    splitInfo: string;
    reimbursedBy: string;
};

export type PaymentCardProps = ExpenseCardBaseProps & {
    paymentData: any;
};

export type RequestCardProps = ExpenseCardBaseProps & {
    requestData: any;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
