<?php

namespace AppBundle\Controller;

use AppBundle\Data\Entity\User;
use AppBundle\Data\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class RegistrationController extends Controller
{
    /**
     * @Route("/registration", name="registration")
     */
    public function indexAction(Request $request)
    {
        $dataManager = new Manager('User');

        $user = new User();
        $user->name = $request->get('name');
        $user->email = $request->get('email');
        $user->categories = $request->get('categories');
        $user->created_date = date('Y-m-d H:i:s');

        $validator = $this->get('validator');
        $errors = $validator->validate($user);

        if (count($errors) > 0) {
            $errorsString = (string) $errors;

            return new JsonResponse([
                'success' => false,
                'message' => $errorsString
            ]);
        }

        $id = $dataManager->persist($user);

        return new JsonResponse([
            'success' => true,
            'id' => $id
        ]);
    }
}