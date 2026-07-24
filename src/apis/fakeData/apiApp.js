export const COMMON = {
    result_code: 200
};

export const GET_MY_INFO = {
    result_code: 200,
    member: {
        id: 1,
        name: 'Demo User',
        account: 'demo',
        email: 'demo@example.com',
        role: 'admin',
        company: {
            id: 1,
            name: 'My Company'
        }
    }
};
