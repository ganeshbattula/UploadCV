import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

type AuthResponse = {
  accessToken: string;
};

const App: React.FC = () => {
  // State variables for email, password, access token, portal URL, and loading state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [portalUrl, setPortalUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // State variable to track loading state

  // Function to validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to validate password complexity and length
  const validatePassword = (password: string) => {
    const minLength = 8;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
    return password.length >= minLength && passwordRegex.test(password);
  };

  // Function to handle login process
  const handleLogin = async () => {
    // Validate email format
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g., example@example.com)');
      return;
    }

    // Validate password complexity and length
    if (!validatePassword(password)) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character');
      return;
    }

    setLoading(true); // Set loading state to true

    try {
      // Fetch login credentials from the server
      const response = await fetch('https://safeguard-me-coding-exercise.azurewebsites.net/api/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle non-OK response
      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
      }

      // Extract access token from the response
      const data: AuthResponse = await response.json();
      setToken(data.accessToken);

      // Fetch portal URL using the access token
      fetchPortalUrl(data.accessToken);
    } catch (error) {
      // Handle login error
      Alert.alert('Login Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false); // Set loading state back to false after login process completes
    }
  };

  // Function to fetch portal URL after successful login
  const fetchPortalUrl = async (accessToken: string) => {
    try {
      // Request portal URL from the server using the access token
      const response = await fetch('https://safeguard-me-coding-exercise.azurewebsites.net/api/PortalUrl', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle non-OK response
      if (!response.ok) {
        throw new Error(`Fetching portal URL failed with status: ${response.status}`);
      }

      // Extract portal URL from the response
      const url = await response.text();
      setPortalUrl(url);
    } catch (error) {
      // Handle error while fetching portal URL
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Function to handle changes in WebView navigation state
  const handleNavigationStateChange = (navState: WebViewNavigation) => {

    // Set upload success navigation
    setPortalUrl(navState.url);
  };

  return (
    <View style={styles.container}>
      {/* Render login form */}
      {!token ? (

        <View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading} // Disable button when loading
            activeOpacity={0.8}
          >
            {loading ? ( // Display loading indicator when loading
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        < WebView // Render WebView to display portal URL 

          source={{ uri: portalUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          style={styles.webView}
        />
      )}
    </View>
  );
};

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 50,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4630EB',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
    marginTop: 20
  },
});
export default App;
