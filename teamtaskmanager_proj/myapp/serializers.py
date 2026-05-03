from rest_framework import serializers
from .models import CustomUser, Project, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            role=validated_data.get('role', 'MEMBER'),
            password=validated_data['password']
        )
        return user

class ProjectSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.ReadOnlyField(source='assignee.username')

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('created_at',)
